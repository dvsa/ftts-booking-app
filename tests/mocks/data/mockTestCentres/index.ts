import { CentreResponse } from '../../../../src/domain/types';
import {
  mockTestCentreAylesbury, mockTestCentreBala, mockTestCentreBirmingham, mockTestCentreBolton, mockTestCentreBoston, mockTestCentreBristol, mockTestCentreBullithWells, mockTestCentreCambridge, mockTestCentreCheltenham, mockTestCentreChester, mockTestCentreChesterfield, mockTestCentreCorby, mockTestCentreCoventry, mockTestCentreDerby, mockTestCentreDoncaster, mockTestCentreDudley, mockTestCentreGloucester, mockTestCentreGrantham, mockTestCentreHereford, mockTestCentreHuddersfield, mockTestCentreLeicester, mockTestCentreLincoln, mockTestCentreLiverpool, mockTestCentreLuton, mockTestCentreMansfield, mockTestCentreMerthyr, mockTestCentreMiltonKeynes, mockTestCentreNewport, mockTestCentreNorthampton, mockTestCentreOldham, mockTestCentreOxford, mockTestCentrePeterborough, mockTestCentreReading, mockTestCentreRedditch, mockTestCentreRhyl, mockTestCentreRhyl2, mockTestCentreSalford, mockTestCentreSheffield, mockTestCentreShrewsbury, mockTestCentreSlough, mockTestCentreStephenage, mockTestCentreStHelens, mockTestCentreStockport, mockTestCentreStokeOnTrent, mockTestCentreStratfordUponAvon, mockTestCentreSuttonColdfield, mockTestCentreSwindon, mockTestCentreWatford, mockTestCentreWigan, mockTestCentreWolverhampton, mockTestCentreWorcester,
} from './gb';
import {
  mockTestCentreAldershot, mockTestCentreBallymena, mockTestCentreBelfast, mockTestCentreLondonderry, mockTestCentreNewry, mockTestCentreOmagh, mockTestCentrePortadown,
} from './ni';

const testCentresGb: CentreResponse = {
  status: 200,
  testCentres: [
    mockTestCentreBirmingham,
    mockTestCentreSuttonColdfield,
    mockTestCentreDudley,
    mockTestCentreWolverhampton,
    mockTestCentreRedditch,
    mockTestCentreCoventry,
    mockTestCentreStratfordUponAvon,
    mockTestCentreWorcester,
    mockTestCentreLeicester,
    mockTestCentreDerby,
    mockTestCentreShrewsbury,
    mockTestCentreStokeOnTrent,
    mockTestCentreCheltenham,
    mockTestCentreNorthampton,
    mockTestCentreGloucester,
    mockTestCentreHereford,
    mockTestCentreCorby,
    mockTestCentreMansfield,
    mockTestCentreChesterfield,
    mockTestCentreMiltonKeynes,
    mockTestCentreOxford,
    mockTestCentreGrantham,
    mockTestCentreAylesbury,
    mockTestCentreChester,
    mockTestCentreSwindon,
    mockTestCentreSheffield,
    mockTestCentreStockport,
    mockTestCentreBullithWells,
    mockTestCentrePeterborough,
    mockTestCentreSalford,
    mockTestCentreOldham,
    mockTestCentreLuton,
    mockTestCentreStHelens,
    mockTestCentreLincoln,
    mockTestCentreBala,
    mockTestCentreBristol,
    mockTestCentreNewport,
    mockTestCentreDoncaster,
    mockTestCentreLiverpool,
    mockTestCentreBolton,
    mockTestCentreWigan,
    mockTestCentreHuddersfield,
    mockTestCentreMerthyr,
    mockTestCentreStephenage,
    mockTestCentreReading,
    mockTestCentreBoston,
    mockTestCentreWatford,
    mockTestCentreSlough,
    mockTestCentreCambridge,
    mockTestCentreRhyl,
    mockTestCentreRhyl2,
  ],
};

const testCentresNi: CentreResponse = {
  status: 200,
  testCentres: [
    mockTestCentreBelfast,
    mockTestCentreBallymena,
    mockTestCentrePortadown,
    mockTestCentreNewry,
    mockTestCentreOmagh,
    mockTestCentreLondonderry,
    mockTestCentreAldershot,
  ],
};

export {
  testCentresGb,
  testCentresNi,
};
