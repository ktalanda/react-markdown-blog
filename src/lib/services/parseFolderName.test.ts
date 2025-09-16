import parseFolderName from './parseFolderName';

describe('parseFolderName', () => {
  it('parses a valid folder name and returns the correct date', () => {
    const result = parseFolderName('250101');
    expect(result).not.toBeNull();
    expect(result?.date.getFullYear()).toBe(2025);
    expect(result?.date.getMonth()).toBe(0); // January is 0
    expect(result?.date.getDate()).toBe(1);
  });

  it('returns null for invalid folder names', () => {
    expect(parseFolderName('invalid')).toBeNull();
    expect(parseFolderName('')).toBeNull();
    expect(parseFolderName('2501')).toBeNull();
    expect(parseFolderName('250101extra')).toBeNull();
  });

  it('returns null if date parts are not numbers', () => {
    expect(parseFolderName('25aa01')).toBeNull();
    expect(parseFolderName('25a101')).toBeNull();
    expect(parseFolderName('2501aa')).toBeNull();
  });
});
