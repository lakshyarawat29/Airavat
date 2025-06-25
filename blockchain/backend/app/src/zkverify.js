// zkverify.js
const snarkjs = require("snarkjs");
const path = require("path");
const fs = require("fs");
const { zkVerifySession, Library, CurveType, ZkVerifyEvents } = require("zkverifyjs");

require("dotenv").config();

async function verify(proof, publicSignals) {
  const ZKV_SEED_PHRASE = process.env.ZKV_SEED_PHRASE;
  const DOMAIN_ID = parseInt(process.env.DOMAIN_ID || "1");

  console.log("Environment check:");
  console.log("ZKV_SEED_PHRASE exists:", !!ZKV_SEED_PHRASE);
  console.log("DOMAIN_ID:", DOMAIN_ID);

  let session;
  let statement, aggregationId;

  try {
    // Check if CIBIL score exceeds threshold
    if (publicSignals[0] === "0") {
      throw new Error("THRESHOLD_NOT_MET: User's CIBIL score is below required threshold");
    }

    // Validate seed phrase
    if (!ZKV_SEED_PHRASE || ZKV_SEED_PHRASE.trim() === '') {
      throw new Error("ZKV_SEED_PHRASE is not set in environment variables");
    }

    // Load verification key
    const verificationPath = path.join(__dirname, "../../circuit/setup/verification_key.json");
    const vk = JSON.parse(fs.readFileSync(verificationPath, "utf8"));

    console.log("Starting zkVerify session...");

    // Start zkVerify session
    session = await zkVerifySession
      .start()
      .Volta()
      .withAccount(ZKV_SEED_PHRASE);
    
    console.log("✅ Connected to zkVerify Volta Testnet");

    return new Promise((resolve, reject) => {
      let isResolved = false;
      let transactionInfo = null;

      // Subscribe to aggregation events
      session.subscribe([
        {
          event: ZkVerifyEvents.NewAggregationReceipt,
          callback: async (eventData) => {
            console.log("📊 New aggregation receipt:", eventData);
            
            if (aggregationId == parseInt(eventData.data.aggregationId.replace(/,/g, ''))) {
              try {
                let statementPath = await session.getAggregateStatementPath(
                  eventData.blockHash,
                  parseInt(eventData.data.domainId),
                  parseInt(eventData.data.aggregationId.replace(/,/g, '')),
                  statement
                );
                
                console.log("📝 Statement path:", statementPath);
                
                const attestationData = {
                  ...statementPath,
                  domainId: parseInt(eventData.data.domainId),
                  aggregationId: parseInt(eventData.data.aggregationId.replace(/,/g, '')),
                  transactionInfo: transactionInfo,
                  timestamp: new Date().toISOString(),
                  proofType: "CIBIL_Score_Verification",
                  threshold: publicSignals[2],
                  merkleRoot: publicSignals[1]
                };
                
                // Save aggregation data
                fs.writeFileSync("cibil_aggregation.json", JSON.stringify(attestationData, null, 2));
                console.log("📁 Aggregation data saved to cibil_aggregation.json");
                
                if (!isResolved) {
                  isResolved = true;
                  resolve({
                    success: true,
                    transactionInfo: transactionInfo,
                    aggregationData: attestationData,
                    message: "CIBIL score verification and aggregation completed successfully"
                  });
                }
              } catch (pathError) {
                console.error("❌ Error getting statement path:", pathError);
              }
            }
          },
          options: { domainId: DOMAIN_ID },
        },
      ]);

      // Submit proof
      const submitProof = async () => {
        try {
          console.log(`📤 Submitting proof to domain ${DOMAIN_ID}...`);
          
          const { events } = await session
            .verify()
            .groth16({
              library: Library.snarkjs,
              curve: CurveType.bn128
            })
            .execute({
              proofData: {
                vk: vk,
                proof: proof,
                publicSignals: publicSignals
              },
              domainId: DOMAIN_ID
            });

          // Listen to events
          events.on(ZkVerifyEvents.IncludedInBlock, (eventData) => {
            console.log("✅ Included in block:", eventData);
            statement = eventData.statement;
            aggregationId = eventData.aggregationId;
            transactionInfo = eventData;
            
            // Save transaction info immediately
            const verificationResult = {
              transactionInfo: eventData,
              statement: eventData.statement,
              aggregationId: eventData.aggregationId,
              proofType: "CIBIL_Score_Verification",
              timestamp: new Date().toISOString(),
              threshold: publicSignals[2],
              merkleRoot: publicSignals[1],
              domainId: DOMAIN_ID
            };
            fs.writeFileSync("cibil_verification_result.json", JSON.stringify(verificationResult, null, 2));
            console.log("📁 Transaction info saved to cibil_verification_result.json");
          });

          events.on(ZkVerifyEvents.Finalized, (eventData) => {
            console.log("✅ Transaction finalized:", eventData);
            
            // Since we have a domain (1), wait for aggregation
            // Don't resolve immediately for domain 1
            if (DOMAIN_ID === 0 && !isResolved) {
              isResolved = true;
              resolve({
                success: true,
                transactionInfo: eventData,
                message: "CIBIL score verification completed successfully (no aggregation)"
              });
            }
          });

          events.on(ZkVerifyEvents.ErrorEvent, (error) => {
            console.error("❌ Event error:", error);
            
            // Handle connection errors gracefully
            if (error.error && error.error.includes('disconnected')) {
              console.log("⚠️ Connection lost, but transaction may have succeeded");
              return; // Don't reject immediately for connection issues
            }
            
            if (!isResolved) {
              isResolved = true;
              reject({
                success: false,
                error: error,
                message: "CIBIL score verification failed"
              });
            }
          });

        } catch (submitError) {
          console.error("❌ Error submitting proof:", submitError);
          if (!isResolved) {
            isResolved = true;
            reject({
              success: false,
              error: submitError,
              message: "Failed to submit proof for verification"
            });
          }
        }
      };

      // Execute proof submission
      submitProof();

      // Timeout for aggregation (2 minutes for domain 1)
      setTimeout(() => {
        if (!isResolved && transactionInfo) {
          console.log("⏰ Aggregation timeout, but transaction was successful");
          isResolved = true;
          resolve({
            success: true,
            transactionInfo: transactionInfo,
            note: "Transaction successful, aggregation may still be pending",
            message: "CIBIL score verification completed (aggregation timeout)"
          });
        } else if (!isResolved) {
          isResolved = true;
          reject({
            success: false,
            error: new Error("Verification timeout"),
            message: "CIBIL score verification timed out"
          });
        }
      }, 120000); // 2 minute timeout
    });

  } catch (error) {
    console.error("❌ Verification process failed:", error);
    throw {
      success: false,
      error: error,
      message: "CIBIL score verification failed: " + error.message
    };
  } finally {
    if (session) {
      try {
        await session.close();
        console.log("🔌 zkVerify session closed");
      } catch (closeError) {
        console.error("❌ Error closing session:", closeError);
      }
    }
  }
}

module.exports = { verify };