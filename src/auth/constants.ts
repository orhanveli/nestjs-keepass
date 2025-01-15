const rpID = 'localhost';

export const webAuthN = {
  /**
   * Human-readable title for your website
   */
  rpName: 'SimpleWebAuthn Example',
  /**
   * A unique identifier for your website. 'localhost' is okay for
   * local dev
   */
  rpID,
  /**
   * The URL at which registrations and authentications should occur.
   * 'http://localhost' and 'http://localhost:PORT' are also valid.
   * Do NOT include any trailing /
   */
  origin: `http://${rpID}`,
};
