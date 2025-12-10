import { describe, it, expect } from 'vitest';
import { createSessionCode, getSessionUrl, SUPPORTED_LANGUAGES, DEFAULT_CODE_TEMPLATES } from './session';

describe('Session Utilities', () => {
  describe('createSessionCode', () => {
    it('should generate a 6-character code', () => {
      const code = createSessionCode();
      expect(code).toHaveLength(6);
    });

    it('should only contain uppercase letters and numbers (no ambiguous characters)', () => {
      const code = createSessionCode();
      expect(code).toMatch(/^[A-Z0-9]{6}$/);
    });

    it('should generate unique codes', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        codes.add(createSessionCode());
      }
      expect(codes.size).toBe(100);
    });
  });

  describe('getSessionUrl', () => {
    it('should return full URL with session code', () => {
      const url = getSessionUrl('ABC123');
      expect(url).toContain('/session/ABC123');
    });
  });

  describe('SUPPORTED_LANGUAGES', () => {
    it('should have at least 10 languages', () => {
      expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(10);
    });

    it('should include common languages', () => {
      const languageIds = SUPPORTED_LANGUAGES.map(l => l.id);
      expect(languageIds).toContain('javascript');
      expect(languageIds).toContain('typescript');
      expect(languageIds).toContain('python');
      expect(languageIds).toContain('java');
    });

    it('should have name, id, and extension for each language', () => {
      SUPPORTED_LANGUAGES.forEach(lang => {
        expect(lang.id).toBeDefined();
        expect(lang.name).toBeDefined();
        expect(lang.extension).toMatch(/^\..+/);
      });
    });
  });

  describe('DEFAULT_CODE_TEMPLATES', () => {
    it('should have templates for common languages', () => {
      expect(DEFAULT_CODE_TEMPLATES.javascript).toBeDefined();
      expect(DEFAULT_CODE_TEMPLATES.typescript).toBeDefined();
      expect(DEFAULT_CODE_TEMPLATES.python).toBeDefined();
    });

    it('should have valid content in templates', () => {
      expect(DEFAULT_CODE_TEMPLATES.javascript).toContain('function');
      expect(DEFAULT_CODE_TEMPLATES.python).toContain('def');
    });
  });
});
