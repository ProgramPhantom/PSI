import { UserRepository } from '../repositories/UserRepository.js';
import { verifyJWT } from '../auth/GoogleOAuth.js';
import type { loginValidationData } from '../controllers/usersController.js';
import type { TokenPayload } from 'google-auth-library';
import type { Users } from '../db/db.js';
import type { UserSession } from '../types/express-session.js';

export const login = async (data: loginValidationData, session: UserSession) => {
  const googleData = await verifyJWT(data.credential, data.clientId);
  if (!googleData) {
    return { code: 400, message: 'Bad token/clientId' };
  }
  //check if the user exists
  const userExistsResponse = await UserRepository.getUserById(googleData.sub);
  if (!userExistsResponse) {
    //create user if not exists
    const insertResult = await createUser(googleData);
    if (
      !insertResult.numInsertedOrUpdatedRows ||
      insertResult.numInsertedOrUpdatedRows == BigInt(0)
    ) {
        throw new Error("ERROR: We had no inserted rows when creating the user that we just confirmed did not exist")
    } else {
      //log user in as session
      createSession(googleData, session)
      return {code: 200, message: "Success: Signed up and logged in"}
    }
  }
  //log user in as session
  createSession(googleData, session)
  return {code: 200, message: "Success: Logged in"}
};

const createUser = async (googleData: TokenPayload) => {
  const newUser: Users = {
    gsub: googleData.sub,
    email: googleData.email ?? '',
    firstname: googleData.given_name ?? '',
    surname: googleData.family_name ?? '',
    picture: googleData.picture ?? null,
  };
  return await UserRepository.createUser(newUser);
};

const createSession = (googleData: TokenPayload, session: UserSession) => {
    session.authenticated = true;
    session.gsub = googleData.sub;
}