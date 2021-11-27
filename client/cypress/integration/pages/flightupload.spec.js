describe("check admin page", () => {
  before(() => {
    cy.visit("/");
    cy.get("button").contains("Flug hochladen").click();
  });

  //   it("test upload only possible for logged-in user", () => {
  //     cy.get("button").contains("Flug hochladen").click();

  //     cy.location("pathname").should("eq", "/login");
  //   });

  it("test upload flight", () => {
    cy.loginNormalUser();

    cy.get("button").contains("Flug hochladen").click();

    cy.get("h3").should("have.text", `Flug hochladen`);

    cy.fixture("73320_LA9ChMu1.igc").then((fileContent) => {
      cy.get('input[type="file"]#igcUploadForm').attachFile({
        fileContent: fileContent.toString(),
        fileName: "73320_LA9ChMu1.igc",
        mimeType: "text/plain",
      });
    });
  });
});
