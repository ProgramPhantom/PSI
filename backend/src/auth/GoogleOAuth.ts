
import {OAuth2Client, type TokenPayload} from 'google-auth-library'
import config from '../config/config.js';

const client = new OAuth2Client();

export const verify = async (token: string, clientId: string) => {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientId,
  });
  const payload: TokenPayload | undefined = ticket.getPayload();
  return payload

}
