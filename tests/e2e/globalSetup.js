import { setEnvVariables } from "./utils/helpers";
// import { AuthPage } from "./pages/authPage";
// import { LandingPage } from "./pages/landingPage";

const { chromium } = require('@playwright/test');

async function globalSetup() {
    // playwright setup
    // const browser = await chromium.launch();
    // const page = await browser.newPage();

    // generate email and set env variables
    const randomEmail = `${Date.now()}_tstact@restmail.net`
    setEnvVariables(randomEmail)

    // commenting out as this its not needed for now
    // // go to sign up page
    // await page.goto(process.env.E2E_TEST_BASE_URL)
    // const landingPage = new LandingPage(page);
    // await landingPage.goToSignIn()

    // // register user with generated email and set as env variable
    // const authPage = new AuthPage(page)
    // await authPage.signIn(process.env.E2E_TEST_ACCOUNT_EMAIL)

    // // // create reuseable state json
    // await page.context().storageState({ path: 'state.json' });
    // await browser.close();
}

export default globalSetup;