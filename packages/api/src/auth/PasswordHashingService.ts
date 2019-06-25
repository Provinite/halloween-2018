import { Component } from "../reflection/Component";
import { hash, compare } from "bcrypt";

const BCRYPT_MAX_INPUT_LENGTH = 72;
const SALT_ROUNDS = 10;

@Component()
export class PasswordHashingService {
  /**
   * Hash a password for storage in the database.
   * @param password - The password to hash
   * @return The hashed password with its salt included.
   */
  async hashPassword(password: string): Promise<string> {
    if (!password) {
      const msg = "Non-empty password required to hash";
      return Promise.reject(new Error(msg));
    }
    if (password.length > BCRYPT_MAX_INPUT_LENGTH) {
      const msg = `Maximum password length exceeded, must not be greater than: ${BCRYPT_MAX_INPUT_LENGTH}`;
      return Promise.reject(new Error(msg));
    }
    return hash(password, SALT_ROUNDS);
  }

  /**
   * Verify a password against a hash + salt.
   * @param password - The incoming password to verify
   * @param passwordHash - The password hash to verify against
   * @return True if the password matches
   */
  async verifyPasswordHash(
    password: string,
    passwordHash: string
  ): Promise<boolean> {
    if (!password || !passwordHash) {
      const msg =
        "Password and existing hash both required to verify credentials.";
      return Promise.reject(new Error(msg));
    }
    return compare(password, passwordHash);
  }
}

declare global {
  interface ApplicationContextMembers {
    passwordHashingService: PasswordHashingService;
  }
}
