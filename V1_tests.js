/* @flow */

/* eslint
  no-console: 0,
  no-alert: 0,
  no-bitwise: 0,
*/

/*
  A typical session would go (always report installation first):
    await myFoodRepoEndpoint.reportInstallation(uuid);

    await myFoodRepoEndpoint.logIn(userInfo)
    .catch(error => handleLoginError(error))

  If needed, before login, create a user like:
    await myFoodRepoEndpoint.createUser(userInfo)
    .catch(error => handleCreateUserError(error))
*/

import { v4 as freshUuid } from 'uuid';

import MFRAPI from './V1';
import type { MFRUserInfo } from './V1';

let myFoodRepoEndpoint: MFRAPI;

// In real life, we should get our uuid from persistence
const storedUuid = '2e58dcd7-0628-47f3-9007-8e09415f70d1';
const uuid = storedUuid || freshUuid();

// These are used for our tests
const userInfo: MFRUserInfo = {
  auth_type: 'email_password',
  email: 'boris.conforty3@epfl.ch',
  password: '12345678',
};

const userInfoUpperCaseToBeTrimmed: MFRUserInfo = {
  ...userInfo,
  email: ` \t${(userInfo.email || '').toUpperCase()} `,
};

const anonymousUserInfo: MFRUserInfo = {
  auth_type: 'anonymous',
};

/* $FlowExpectedError - Here, we put an invalid auth_type on purpose */
const userInfoWrongAuthType: MFRUserInfo = {
  ...userInfo,
  auth_type: 'blabla',
};

const userInfoWrongEmail: MFRUserInfo = {
  ...userInfo,
  email: 'blabla',
};

const userInfoWrongPassword: MFRUserInfo = {
  ...userInfo,
  password: 'blabla',
};

const newUserInfo: MFRUserInfo = {
  auth_type: 'email_password',
  email: `Boris.Conforty${Math.random()}@epfl.ch`,
  password: '123456a!',
};

const modifiedUserInfo: MFRUserInfo = {
  first_name: 'Boris',
  last_name: 'Conforty',
};

const modifiedUserAuth1: MFRUserInfo = {
  email: 'newUserInfo.email',
  password: newUserInfo.email,
};

const modifiedUserAuth2: MFRUserInfo = {
  email: 'boris.conforty3@epfl.ch',
  password: newUserInfo.password,
};

const modifiedUserAuth3: MFRUserInfo = {
  email: 'boris.conforty3999@epfl.ch',
  password: newUserInfo.password,
};

const modifiedUserAuth4: MFRUserInfo = {
  email: 'boris.conforty3999@epfl.ch',
  password: newUserInfo.password,
  new_password: 'newUserInfo.email1',
};

const modifiedUserAuth5: MFRUserInfo = {
  email: 'boris.conforty3999@epfl.ch',
  password: newUserInfo.password,
  new_password: '12',
};

const newUserInfoWrongEmail: MFRUserInfo = {
  auth_type: 'email_password',
  email: `boris.conforty${Math.random()}epfl.ch`,
  password: '123456a!',
};

// Password too short
const newUserInfoWrongPassword: MFRUserInfo = {
  auth_type: 'email_password',
  email: `boris.conforty${Math.random()}@epfl.ch`,
  password: '123',
};

// Password doesn't have a letter
const newUserInfoWrongPassword2: MFRUserInfo = {
  auth_type: 'email_password',
  email: `boris.conforty${Math.random()}@epfl.ch`,
  password: '12345678',
};

// Password doesn't have a number
const newUserInfoWrongPassword3: MFRUserInfo = {
  auth_type: 'email_password',
  email: `boris.conforty${Math.random()}@epfl.ch`,
  password: 'abcdefgh',
};

// Password doesn't have a special character
const newUserInfoWrongPassword4: MFRUserInfo = {
  auth_type: 'email_password',
  email: `boris.conforty${Math.random()}@epfl.ch`,
  password: '123456ab',
};

function expectedText(expected) {
  /* $FlowExpectedError */
  return ['!!! UNEXPECTED !!!', 'EXPECTED'][expected | 0];
}

// Test functions
async function reportInstallation() {
  return myFoodRepoEndpoint.reportInstallation(uuid);
}
async function reportInstallationWrongUuid() {
  return myFoodRepoEndpoint.reportInstallation('asdf');
}
async function loginAnonymousUser() {
  return myFoodRepoEndpoint.logIn(anonymousUserInfo);
}
async function loginExistingUser() {
  return myFoodRepoEndpoint.logIn(userInfoUpperCaseToBeTrimmed);
}
async function loginWrongAuthType() {
  return myFoodRepoEndpoint.logIn(userInfoWrongAuthType);
}
async function loginWrongEmail() {
  return myFoodRepoEndpoint.logIn(userInfoWrongEmail);
}
async function loginWrongPassword() {
  return myFoodRepoEndpoint.logIn(userInfoWrongPassword);
}
async function loginNewUser() {
  return myFoodRepoEndpoint.logIn(newUserInfo);
}
async function modifyUser() {
  return myFoodRepoEndpoint.updateUser(modifiedUserInfo);
}
async function modifyUserLogin1() {
  return myFoodRepoEndpoint.updateUserLogin(modifiedUserAuth1);
}
async function modifyUserLogin2() {
  return myFoodRepoEndpoint.updateUserLogin(modifiedUserAuth2);
}
async function modifyUserLogin3() {
  return myFoodRepoEndpoint.updateUserLogin(modifiedUserAuth3);
}
async function modifyUserLogin4() {
  return myFoodRepoEndpoint.updateUserLogin(modifiedUserAuth4);
}
async function modifyUserLogin5() {
  return myFoodRepoEndpoint.updateUserLogin(modifiedUserAuth5);
}
async function createUser() {
  return myFoodRepoEndpoint.createUser(newUserInfo);
}
async function createUserWrongEmail() {
  return myFoodRepoEndpoint.createUser(newUserInfoWrongEmail);
}
async function createUserWrongPassword() {
  return myFoodRepoEndpoint.createUser(newUserInfoWrongPassword);
}
async function createUserWrongPassword2() {
  return myFoodRepoEndpoint.createUser(newUserInfoWrongPassword2);
}
async function createUserWrongPassword3() {
  return myFoodRepoEndpoint.createUser(newUserInfoWrongPassword3);
}
async function createUserWrongPassword4() {
  return myFoodRepoEndpoint.createUser(newUserInfoWrongPassword4);
}
async function deleteUser() {
  return myFoodRepoEndpoint.deleteUser();
}
async function getUser() {
  return myFoodRepoEndpoint.getUser();
}
async function getUserWithId() {
  const userId = myFoodRepoEndpoint.user.id;
  return myFoodRepoEndpoint.getUser(userId);
}
async function getUserWithWrongId() {
  return myFoodRepoEndpoint.getUser(982374691872364);
}
async function logout() {
  return myFoodRepoEndpoint.logOut();
}

// That's where we'll store our test results
const testResults: string[] = [];

async function testFunction(
  f: Function,
  text: string,
  expectSuccess: boolean = true,
) {
  const t = new Date();
  await f()
  .then(response =>
    testResults.push(
      `${text}\n${expectedText(expectSuccess)} SUCCESS\nDone in ${new Date() -
          t} ms\n${JSON.stringify(response)}`,
    ))
  .catch(error =>
    testResults.push(
      `${text}\n${expectedText(
        !expectSuccess,
      )} FAILURE\nDone in ${new Date() - t} ms\n${error}`,
    ));
}

export default async function runTests(apiKey: string) {
  myFoodRepoEndpoint = new MFRAPI(apiKey);

  // Should fail
  await testFunction(
    reportInstallationWrongUuid,
    'Installation report with invalid UUID',
    false,
  );

  // We must first report our installation details.
  // Should be fine since our UUID is valid
  await testFunction(reportInstallation, 'Installation report');

  // Should succeed
  await testFunction(loginAnonymousUser, 'Anonymous user login');
  await testFunction(getUser, 'Get user');
  await testFunction(getUserWithId, 'Get user with ID');
  // Should fail
  await testFunction(getUserWithWrongId, 'Get user with wrong ID', false);
  // Should succeed
  await testFunction(logout, 'Logout');

  // Should fail, since we logged out
  await testFunction(getUser, 'Get user after logout', false);

  // Should succeed
  await testFunction(loginExistingUser, 'Existing user login');
  await testFunction(getUser, 'Get user');
  await testFunction(logout, 'Logout');

  // Should fail, since we logged out
  await testFunction(getUser, 'Get user after logout', false);

  // Should fail
  await testFunction(loginWrongAuthType, 'Login with wrong auth_type', false);
  await testFunction(loginWrongEmail, 'Login with wrong email', false);
  await testFunction(loginWrongPassword, 'Login with wrong password', false);

  await testFunction(
    createUserWrongEmail,
    'Create user with invalid email',
    false,
  );
  await testFunction(
    createUserWrongPassword,
    'Create user with invalid password',
    false,
  );
  await testFunction(
    createUserWrongPassword2,
    'Create user with invalid password - 2',
    false,
  );
  await testFunction(
    createUserWrongPassword3,
    'Create user with invalid password - 3',
    false,
  );
  await testFunction(
    createUserWrongPassword4,
    'Create user with invalid password - 4',
    false,
  );

  // Should fail, since the user doesn't exist yet
  await testFunction(loginNewUser, 'Non-existing user login', false);

  // Should be able to create a new user, log her in and delete her
  await testFunction(createUser, 'Create user');
  await testFunction(loginNewUser, 'Newly created user login');
  await testFunction(modifyUser, 'User modification');
  await testFunction(getUser, 'Get user after modification');
  await testFunction(modifyUserLogin1, 'User login modification 1', false);
  await testFunction(modifyUserLogin2, 'User login modification 2', false);
  await testFunction(modifyUserLogin3, 'User login modification 3');
  await testFunction(modifyUserLogin4, 'User login modification 4');
  await testFunction(modifyUserLogin5, 'User login modification 5', false);
  await testFunction(deleteUser, 'User deletion');

  // Should fail, since the user has been deleted
  await testFunction(getUser, 'Get user after deletion', false);

  // Gather results and report
  let results = testResults.join('\n\n***************\n');
  if (results.indexOf('UNEXPECTED') >= 0) {
    results = `AT LEAST ONE TEST FAILED!\n\n${results}`;
  } else {
    results = `ALL TESTS WENT FINE :)\n\n${results}`;
  }
  console.log(results);
  alert(results);
}
