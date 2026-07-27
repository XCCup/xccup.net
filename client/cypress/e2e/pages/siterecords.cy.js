describe("check siteRecords page", () => {
  before(() => {
    cy.seedDb();
  });

  beforeEach(() => {
    cy.visit("/");
  });

  it("Upload new record for site", () => {
    const igcFileName = "68090_K3EThSc1.igc";
    const expectedTakeoff = "Niederzissen/Bausenberg";
    const expectedUserName = "Melinda Tremblay";
    const expectedDistance = "14 km";

    cy.fixture(igcFileName).then((fileContent) => {
      cy.request({
        url: "http://localhost:3000/api/flights/leonardo",
        method: "POST",
        body: {
          user: "blackhole+melinda@xccup.net",
          pass: "PW_MelindaTremblay",
          IGCigcIGC: fileContent.toString(),
          igcfn: igcFileName,
        },
        form: true,
      });

      cy.visit(`/fluggebietsrekorde/`);

      cy.get("table")
        .contains("td", expectedTakeoff)
        .parent()
        .should("include.text", expectedUserName)
        .and("include.text", expectedDistance);
    });
  });
});
