export const LEONARDO_ENDPOINT_MESSAGE = `<h4>Usage of the Leonardo endpoint:</h4>
URL: https://xccup.net/api/flights/leonardo<br/>
HTTP-Method: POST<br/>
Content-Type: multipart/form-data<br/>
<br/>
Fields:<br/>
* user: User e-mail<br/>
* pass: User password<br/>
* IGCigcIGC: IGC file content (plain-text)<br/>
* igcfn: IGC file name<br/>
* report: Flight report (optional)<br/>
<br/>
<h5>Important:</h5>
The users default glider will be used. Submitted glider information will be ignrored. <br/>
This is due to the XCCup rules and aspect ratio related points calculation.
`;
