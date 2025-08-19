const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  resetPasswordSchema,
  forgotPasswordSchema
} = require('../src/validators/authValidator');

describe('Auth Validators', () => {
  describe('registerSchema', () => {
    it('should validate valid registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const { error } = registerSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('valid email address');
    });

    it('should reject password shorter than 6 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '12345'
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('at least 6 characters');
    });

    it('should reject password longer than 255 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'a'.repeat(256)
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('not exceed 255 characters');
    });

    it('should reject missing required fields', () => {
      const invalidData = {};

      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details.length).toBeGreaterThanOrEqual(1); // at least email is required
    });

    it('should allow optional firstName and lastName', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const { error } = registerSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject firstName longer than 50 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'a'.repeat(51)
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('not exceed 50 characters');
    });

    it('should reject lastName longer than 50 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        lastName: 'a'.repeat(51)
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('not exceed 50 characters');
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const { error } = loginSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const { error } = loginSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('valid email address');
    });

    it('should reject missing email', () => {
      const invalidData = {
        password: 'password123'
      };

      const { error } = loginSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Email is required');
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com'
      };

      const { error } = loginSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Password is required');
    });

    it('should reject empty data', () => {
      const invalidData = {};

      const { error } = loginSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details.length).toBeGreaterThanOrEqual(1); // at least one field is required
    });
  });

  describe('changePasswordSchema', () => {
    it('should validate valid password change data', () => {
      const validData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123'
      };

      const { error } = changePasswordSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject missing current password', () => {
      const invalidData = {
        newPassword: 'newpassword123'
      };

      const { error } = changePasswordSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Current password is required');
    });

    it('should reject missing new password', () => {
      const invalidData = {
        currentPassword: 'oldpassword123'
      };

      const { error } = changePasswordSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('New password is required');
    });

    it('should reject new password shorter than 6 characters', () => {
      const invalidData = {
        currentPassword: 'oldpassword123',
        newPassword: '12345'
      };

      const { error } = changePasswordSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('at least 6 characters');
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate valid reset password data', () => {
      const validData = {
        token: 'reset-token-123',
        password: 'newpassword123'
      };

      const { error } = resetPasswordSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject missing token', () => {
      const invalidData = {
        newPassword: 'newpassword123'
      };

      const { error } = resetPasswordSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Reset token is required');
    });

    it('should reject missing new password', () => {
      const invalidData = {
        token: 'reset-token-123'
      };

      const { error } = resetPasswordSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Password is required');
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate valid forgot password data', () => {
      const validData = {
        email: 'test@example.com'
      };

      const { error } = forgotPasswordSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email'
      };

      const { error } = forgotPasswordSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('valid email address');
    });

    it('should reject missing email', () => {
      const invalidData = {};

      const { error } = forgotPasswordSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Email is required');
    });
  });
});
