// zkverify.js

const snarkjs = require("snarkjs");
const path = require("path");
const fs = require("fs");
const { zkVerifySession, ZkVerifyEvents, Library, CurveType } = require("zkverifyjs");

require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.secrets" });

async function verify(proof, publicSignals) {
  const ZKV_SEED_PHRASE = "winner stamp fabric because gallery embody oyster achieve resemble bullet business fee";

  try {
    if (publicSignals[1] === "0") {
      throw new Error("THRESHOLD_NOT_MET: Student score is below required threshold of 1400");
    }

    const verificationPath = path.join(__dirname, "../../circuit/setup/verification_key.json");
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
            fs.writeFileSync("aggregation.json", JSON.stringify(statementproof, null, 2));
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
        console.log("Included in block", eventData);
        statement = eventData.statement;
        aggregationId = eventData.aggregationId;
      });

      events.on(ZkVerifyEvents.Finalized, (eventData) => {
        console.log('Transaction finalized:', eventData);
        
        // Resolve immediately after finalization - we don't need to wait for aggregation
        if (!isResolved) {
          isResolved = true;
          setTimeout(() => {
            session.close().catch(() => {}); // Close session but don't wait
            resolve(true);
          }, 100); // Small delay to allow aggregation to start
        }
      });

      events.on('error', (error) => {
        console.error("Event error:", error);
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
            reject(new Error('Verification timeout - proof not processed'));
          }
        }
      }, 60000);
    });

  } catch (error) {
    console.error("Verification process failed:", error);
    return false;
  }
}

module.exports = { verify };