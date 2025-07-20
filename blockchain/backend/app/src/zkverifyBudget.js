const snarkjs = require("snarkjs");
const path = require("path");
const fs = require("fs");
const { zkVerifySession, ZkVerifyEvents, Library, CurveType } = require("zkverifyjs");

require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.secrets" });

async function verifyBudgetWithZkVerify(proof, publicSignals) {
  const ZKV_SEED_PHRASE = "winner stamp fabric because gallery embody oyster achieve resemble bullet business fee";

  try {
    // Don't check budget result here - verify the proof regardless
    // The budget result is determined by publicSignals[0]: 1 = under budget, 0 = over budget

    const verificationPath = path.join(__dirname, "../../budget_checker_circuit/setup/verification_key.json");
    const vk = JSON.parse(fs.readFileSync(verificationPath, "utf8"));

    // Establish zkVerify session
    const session = await zkVerifySession
      .start()
      .Volta() 
      .withAccount(ZKV_SEED_PHRASE);

    let statement, aggregationId;

    // Subscribe to aggregation receipt events
    session.subscribe([
      {
        event: ZkVerifyEvents.NewAggregationReceipt,
        callback: async (eventData) => {
          console.log("New aggregation receipt:", eventData);
          if (aggregationId == parseInt(eventData.data.aggregationId.replace(/,/g, ''))) {
            let statementpath = await session.getAggregateStatementPath(
              eventData.blockHash,
              parseInt(eventData.data.domainId),
              parseInt(eventData.data.aggregationId.replace(/,/g, '')),
              statement
            );
            console.log("Statement path:", statementpath);
            const statementproof = {
              ...statementpath,
              domainId: parseInt(eventData.data.domainId),
              aggregationId: parseInt(eventData.data.aggregationId.replace(/,/g, '')),
            };
            fs.writeFileSync("budget_aggregation.json", JSON.stringify(statementproof, null, 2));
          }
        },
        options: { domainId: 0 },
      },
    ]);

    // Submit proof for verification
    const { events } = await session.verify()
      .groth16({ library: Library.snarkjs, curve: CurveType.bn128 })
      .execute({
        proofData: {
          vk: vk,
          proof: proof,
          publicSignals: publicSignals
        },
        domainId: 0
      });

    return new Promise((resolve, reject) => {
      let isResolved = false;

      events.on(ZkVerifyEvents.IncludedInBlock, (eventData) => {
        console.log("Budget proof included in block", eventData);
        statement = eventData.statement;
        aggregationId = eventData.aggregationId;
      });

      events.on(ZkVerifyEvents.Finalized, (eventData) => {
        console.log('🎉 Budget proof transaction finalized:', eventData);
        
        // Resolve with both verification status and the actual result
        if (!isResolved) {
          isResolved = true;
          setTimeout(() => {
            session.close().catch(() => {}); // Close session but don't wait
            resolve({
              verified: true,
              result: parseInt(publicSignals[0]) // The actual budget check result from the circuit
            });
          }, 100);
        }
      });

      events.on('error', (error) => {
        console.error("Budget verification event error:", error);
        if (!isResolved) {
          isResolved = true;
          session.close().catch(() => {});
          reject(error);
        }
      });

      // Timeout after 60 seconds
      setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          session.close().catch(() => {});
          if (statement && aggregationId) {
            resolve(true);
          } else {
            reject(new Error('Budget verification timeout - proof not processed'));
          }
        }
      }, 60000);
    });

  } catch (error) {
    console.error("Budget verification process failed:", error);
    return false;
  }
}

module.exports = { verifyBudgetWithZkVerify };
