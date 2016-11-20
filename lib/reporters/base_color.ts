import 'colors'

export class BaseColorReporter {
  USE_COLORS = true

  LOG_SINGLE_BROWSER = '%s: ' + '%s'.cyan + '\n'
  LOG_MULTI_BROWSER = '%s %s: ' + '%s'.cyan + '\n'

  SPEC_FAILURE = '%s %s FAILED'.red + '\n'
  SPEC_SLOW = '%s SLOW %s: %s'.yellow + '\n'
  ERROR = '%s ERROR'.red + '\n'

  FINISHED_ERROR = ' ERROR'.red
  FINISHED_SUCCESS = ' SUCCESS'.green
  FINISHED_DISCONNECTED = ' DISCONNECTED'.red

  X_FAILED = ' (%d FAILED)'.red

  TOTAL_SUCCESS = 'TOTAL: %d SUCCESS'.green + '\n'
  TOTAL_FAILED = 'TOTAL: %d FAILED, %d SUCCESS'.red + '\n'
}
