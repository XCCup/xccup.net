import axios from "axios";

describe("check siteRecords page", () => {
  before(() => {
    cy.seedDb();
  });

  beforeEach(() => {
    cy.visit("/");
  });

  it("Upload new record for site", () => {
    const form = new FormData();

    const igcFileName = "68090_K3EThSc1.igc";
    const expectedTakeoff = "Niederzissen/Bausenberg";
    const expectedUserName = "Melinda Tremblay";
    const expectedDistance = "14 km";

    cy.fixture(igcFileName).then(async (fileContent) => {
      form.append("user", "blackhole+melinda@xccup.net");
      form.append("pass", "PW_MelindaTremblay");
      form.append("IGCigcIGC", fileContent.toString());
      form.append("igcfn", igcFileName);

      const data = (
        await axios.post("http://localhost:3000/api/flights/leonardo", form)
      ).data;

      // Wait till flight was fully calculated
      cy.wait(3000);
      cy.visit(`/fluggebietsrekorde/`);

      cy.get("table")
        .contains("td", expectedTakeoff)
        .parent()
        .should("include.text", expectedUserName)
        .and("include.text", expectedDistance);
    });
  });
});
