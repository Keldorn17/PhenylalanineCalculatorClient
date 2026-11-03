import { describe, it, expect } from 'vitest';
import { FormControl } from '@angular/forms';
import { USERNAME_PATTERN, usernameValidator } from './username-validator';

describe('Username Validator', () => {
  it('should validate valid usernames', () => {
    const validUsernames = ['abc', 'User123', 'john_doe', 'cool-user_99', 'a'.repeat(32)];
    for (const username of validUsernames) {
      const control = new FormControl(username);
      expect(usernameValidator(control)).toBeNull();
    }
  });

  it('should reject usernames shorter than 3 characters', () => {
    const control = new FormControl('ab');
    expect(usernameValidator(control)).toEqual({
      pattern: {
        actualValue: 'ab',
        requiredPattern: USERNAME_PATTERN.toString()
      }
    });
  });

  it('should reject usernames longer than 32 characters', () => {
    const control = new FormControl('a'.repeat(33));
    expect(usernameValidator(control)).toEqual({
      pattern: {
        actualValue: 'a'.repeat(33),
        requiredPattern: USERNAME_PATTERN.toString()
      }
    });
  });

  it('should reject usernames containing spaces', () => {
    const spaceUsernames = ['user name', ' username', 'username '];
    for (const username of spaceUsernames) {
      const control = new FormControl(username);
      expect(usernameValidator(control)).not.toBeNull();
    }
  });

  it('should reject usernames containing invalid special characters', () => {
    const invalidUsernames = ['user@name', 'user#1', 'user$name', 'user.name'];
    for (const username of invalidUsernames) {
      const control = new FormControl(username);
      expect(usernameValidator(control)).not.toBeNull();
    }
  });

  it('should return null for empty values', () => {
    const emptyControl = new FormControl('');
    expect(usernameValidator(emptyControl)).toBeNull();
  });
});
