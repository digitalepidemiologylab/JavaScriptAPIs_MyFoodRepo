/* @flow */

/* eslint
  no-console: 0,
  no-alert: 0,
*/

/*
  A typical session would go (always report installation first):
    await myOpenFoodEndpoint.reportInstallation(uuid);

    await myOpenFoodEndpoint.logIn(userInfo)
    .catch(error => handleLoginError(error))

  If needed, before login, create a user like:
    await myOpenFoodEndpoint.createUser(userInfo)
    .catch(error => handleCreateUserError(error))
*/

import MyOpenFoodAPI from './V1';
import type { MyOpenFoodUserInfo } from './V1';

import { v4 as freshUuid } from 'uuid';

let myOpenFoodEndpoint: MyOpenFoodAPI;

// In real life, we should get our uuid from persistence
const storedUuid = '2e58dcd7-0628-47f3-9007-8e09415f70d1';
const uuid = storedUuid || freshUuid();

// These are used for our tests
const userInfo: MyOpenFoodUserInfo = {
  auth_type: 'email_password',
  email: 'boris.conforty3@epfl.ch',
  password: '12345678',
};

/* $FlowForTest - Here, we put an invalid auth_type on purpose */
const userInfoWrongAuthType: MyOpenFoodUserInfo = {
  ...userInfo,
  auth_type: 'blabla',
};

const userInfoWrongEmail: MyOpenFoodUserInfo = {
  ...userInfo,
  email: 'blabla',
};

const userInfoWrongPassword: MyOpenFoodUserInfo = {
  ...userInfo,
  password: 'blabla',
};

const newUserInfo: MyOpenFoodUserInfo = {
  auth_type: 'email_password',
  email: `boris.conforty${Math.random()}@epfl.ch`,
  password: '12345678',
};

const newUserInfoWrongEmail: MyOpenFoodUserInfo = {
  auth_type: 'email_password',
  email: `boris.conforty${Math.random()}epfl.ch`,
  password: '12345678',
};

const newUserInfoWrongPassword: MyOpenFoodUserInfo = {
  auth_type: 'email_password',
  email: `boris.conforty${Math.random()}@epfl.ch`,
  password: '123',
};

function expectedText(expected) {
  /* $FlowForTest */
  return ['!!! UNEXPECTED !!!', 'EXPECTED'][expected | 0]; // eslint-disable-line no-bitwise
}

// Test functions
async function reportInstallation() {
  return myOpenFoodEndpoint.reportInstallation(uuid);
}
async function reportInstallationWrongUuid() {
  return myOpenFoodEndpoint.reportInstallation('asdf');
}
async function loginExistingUser() {
  return myOpenFoodEndpoint.logIn(userInfo);
}
async function loginWrongAuthType() {
  return myOpenFoodEndpoint.logIn(userInfoWrongAuthType);
}
async function loginWrongEmail() {
  return myOpenFoodEndpoint.logIn(userInfoWrongEmail);
}
async function loginWrongPassword() {
  return myOpenFoodEndpoint.logIn(userInfoWrongPassword);
}
async function loginNewUser() {
  return myOpenFoodEndpoint.logIn(newUserInfo);
}
async function createUser() {
  return myOpenFoodEndpoint.createUser(newUserInfo);
}
async function createUserWrongEmail() {
  return myOpenFoodEndpoint.createUser(newUserInfoWrongEmail);
}
async function createUserWrongPassword() {
  return myOpenFoodEndpoint.createUser(newUserInfoWrongPassword);
}
async function deleteUser() {
  return myOpenFoodEndpoint.deleteUser();
}
async function getUser() {
  return myOpenFoodEndpoint.getUser();
}
async function getUserWithId() {
  const userId = myOpenFoodEndpoint.user.id;
  return myOpenFoodEndpoint.getUser(userId);
}
async function getUserWithWrongId() {
  const userId = myOpenFoodEndpoint.user.id;
  return myOpenFoodEndpoint.getUser(982374691872364);
}
async function logout() {
  return myOpenFoodEndpoint.logOut();
}

// That's where we'll store our test results
const testResults: string[] = [];

async function testFunction(f: Function, text: string, expectSuccess: boolean = true) {
  await f()
  .then(response => testResults.push(`${text}\n${expectedText(expectSuccess)} SUCCESS\n\n${JSON.stringify(response)}`))
  .catch(error => testResults.push(`${text}\n${expectedText(!expectSuccess)} FAILURE\n\n${error}`));
}

export default async function runTests(apiKey: string) {
  myOpenFoodEndpoint = new MyOpenFoodAPI(apiKey);

  // Should fail
  await testFunction(reportInstallationWrongUuid, 'Installation report with invalid UUID', false);

  // We must first report our installation details. Should be fine since our UUID is valid
  await testFunction(reportInstallation, 'Installation report');

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

  await testFunction(createUserWrongEmail, 'Create user with invalid email', false);
  await testFunction(createUserWrongPassword, 'Create user with invalid password', false);

  // Should fail, since the user doesn't exist yet
  await testFunction(loginNewUser, 'Non-existing user login', false);

  // Should be able to create a new user, log her in and delete her
  await testFunction(createUser, 'Create user');
  await testFunction(loginNewUser, 'Newly created user login');
  await testFunction(deleteUser, 'User deletion');

  // Should fail, since the user has been deleted
  await testFunction(getUser, 'Get user after deletion', false);

  // Gather results and report
  let results = testResults.join('\n\n***************\n');
  if (results.indexOf('UNEXPECTED') >= 0) {
    results = `AT LEAST ONE TEST FAILED\n\n${results}`;
  }
  console.log(results);
  alert(results);
}
