import { importCml, exportCml } from '../base/marvinAPI';
import { BENZOL } from './structureForTest';

describe('Test marvin js api', () => {
  it('import <-> export structure', async () => {
    expect.assertions(1);
    await importCml(BENZOL.CML);
    const cml = await exportCml();
    await expect(cml).toEqual(BENZOL.CML);
  });
});

