const isDev = process.env.DEV_MODE === 'true';

module.exports = {
  iGateAppCode1: '7861887',
  iGateAppCode2: '518949',
  fileIdDownloader: isDev
    ? 'AgACAgQAAxkBAAMGahXMUdbXNutfxxz49f82Y5oUVfkAAjIQaxvmqrFQC9yKl7KIvQABAQADAgADbQADOwQ'
    : 'AgACAgQAAxkBAAIBV2oRztHDxZwkehm_kr11hQ_RWWsuAAJXD2sbs26RULcXWGcHZwPsAQADAgADbQADOwQ',
  fileIdAbout: isDev
    ? 'AgACAgQAAxkBAAMQahXRe8TU05Ru-YMrMGP0DcenHIwAAjYQaxvmqrFQf9QSWMiX3xABAAMCAAN5AAM7BA'
    : 'AgACAgQAAxkBAAIBZmoR0eSHXS2zgebi-HiCxQ5cVO7gAAJcD2sbs26RUDBv2_brK71vAQADAgADeQADOwQ',
};
