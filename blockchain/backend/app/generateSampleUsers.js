const circomlibjs = require("circomlibjs");
const fs = require("fs");
const path = require("path");

async function regenerateSampleUsersWithPrivacy() {
  const poseidon = await circomlibjs.buildPoseidonOpt();
  
  // Original user data with actual spends (for testing) - 20 users
  const originalUsers = [
    {
      id: "user1",
      userIDHash: "4530386221719214629917224067180452510122462265875569215596713246084978167440",
      spends: ["202", "204", "245", "279", "122"]
    },
    {
      id: "user2", 
      userIDHash: "43488853149717502687027963371924194646128538604829241978156474162431359779235",
      spends: ["280", "290", "103", "192", "267"]
    },
    {
      id: "user3",
      userIDHash: "39974879905092829006473681025287312518002798070211489457126906442488585202891",
      spends: ["247", "269", "266", "270", "111"]
    },
    {
      id: "user4",
      userIDHash: "37276826142381397098379236632026690543352244047491791552422293964560642263054",
      spends: ["112", "237", "193", "124", "269"]
    },
    {
      id: "user5",
      userIDHash: "40810182656282213357785238155022730281260493231649098163653003750593054516290",
      spends: ["199", "174", "200", "300", "163"]
    },
    {
      id: "user6",
      userIDHash: "107064817954385849502626854493107911743451990992112264860191308424972949880989",
      spends: ["246", "188", "173", "224", "278"]
    },
    {
      id: "user7",
      userIDHash: "22799540278097028679038466241736855799607954140857355700630192592870660832170",
      spends: ["290", "280", "283", "290", "165"]
    },
    {
      id: "user8",
      userIDHash: "111288356641290955539842840983678779717906453977791345957124940663731871685496",
      spends: ["231", "292", "160", "103", "292"]
    },
    {
      id: "user9",
      userIDHash: "7111254191813724967853213991026443479744451045263093837116003354136711581944",
      spends: ["278", "103", "294", "269", "272"]
    },
    {
      id: "user10",
      userIDHash: "41498120716987868455842945070841226098302057400958533250584054586220123771547",
      spends: ["120", "297", "202", "199", "250"]
    },
    {
      id: "user11",
      userIDHash: "58379043976354578773264429006344626613840249876667265531315968567902372178102",
      spends: ["274", "218", "268", "108", "224"]
    },
    {
      id: "user12",
      userIDHash: "85581049069537639186875001312469604096007124570703390135659111655779291297732",
      spends: ["215", "284", "171", "266", "187"]
    },
    {
      id: "user13",
      userIDHash: "10948939266482718940430365320779461232283465965981757071360134283544457756226",
      spends: ["136", "288", "131", "268", "238"]
    },
    {
      id: "user14",
      userIDHash: "99041671190267725706159564085175993089582565126050021032545725088145803387643",
      spends: ["134", "135", "258", "251", "277"]
    },
    {
      id: "user15",
      userIDHash: "19695754849296950391642120228861575656869695349113362679104082816026915697772",
      spends: ["128", "185", "107", "185", "242"]
    },
    {
      id: "user16",
      userIDHash: "35231076853002198603234633667705743594448306755172972369827552535639018012252",
      spends: ["266", "293", "197", "202", "157"]
    },
    {
      id: "user17",
      userIDHash: "19168519603034118254493647086244898919141881688518376382847203804341819877212",
      spends: ["121", "289", "215", "140", "231"]
    },
    {
      id: "user18",
      userIDHash: "106647260276190389692337553692422553960452755186602756114194164259286492892879",
      spends: ["238", "252", "201", "109", "103"]
    },
    {
      id: "user19",
      userIDHash: "5171197147597946006182581457261323756194445233035266431384068579050952798613",
      spends: ["124", "143", "231", "170", "169"]
    },
    {
      id: "user20",
      userIDHash: "57860523445833662371941774986635695182211448297640021260386547924833951502023",
      spends: ["195", "210", "208", "297", "174"]
    }
  ];
  
  // Generate privacy-preserving user data
  const privacyUsers = await Promise.all(originalUsers.map(async (user) => {
    // Convert spends to BigInt
    const spendsArray = user.spends.map(spend => BigInt(spend));
    
    // Hash the spends: spendsHash = Poseidon(spends[])
    const spendsHash = poseidon(spendsArray);
    
    // Hash the leaf: leafHash = Poseidon(userIdHash, spendsHash)
    const leafHash = poseidon([BigInt(user.userIDHash), spendsHash]);
    
    return {
      id: user.id,
      userIDHash: user.userIDHash,
      spendsHash: poseidon.F.toString(spendsHash),
      leafHash: poseidon.F.toString(leafHash)
    };
  }));
  
  // Write updated file
  fs.writeFileSync(
    path.join(__dirname, "sampleUsers.json"),
    JSON.stringify(privacyUsers, null, 2)
  );
  
  console.log("✅ Updated sampleUsers.json with privacy-preserving design");
  console.log(`📊 Generated ${privacyUsers.length} users`);
  console.log("📝 Note: Only spendsHash is stored, not actual spends");
  
  // Display summary
  console.log("\n📋 Summary:");
  privacyUsers.forEach(user => {
    console.log(`${user.id}: spendsHash=${user.spendsHash.substring(0, 10)}...`);
  });
}

regenerateSampleUsersWithPrivacy().catch(console.error);