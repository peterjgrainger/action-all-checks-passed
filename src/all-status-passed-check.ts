import {ActionContext} from './action-context'
import {debug} from '@actions/core'

export async function allStatusPassedCheck(
  actionContext: ActionContext
): Promise<void> {
  const runId = actionContext.getInput('runId')
  if (!runId) throw ReferenceError('Run ID not set')

  try {
    const run = await actionContext.octokit.actions.getWorkflowRun({
      ...actionContext.context.repo,
      //eslint-disable-next-line @typescript-eslint/camelcase
      run_id: parseInt(runId)
    })

    const checkSuiteId = run.data.check_suite_id

    const checks = await actionContext.octokit.checks.listForSuite({
      ...actionContext.context.repo,
      //eslint-disable-next-line @typescript-eslint/camelcase
      check_suite_id: checkSuiteId
    })

    const successfulRuns = checks.data.check_runs.filter(
      value => value.conclusion === 'success'
    )

    if (successfulRuns.length > checks.data.total_count - 1) {
      actionContext.setFailed('All checks have not run successfully')
    }

    debug(`${successfulRuns.length} runs are successful`)
  } catch (error) {
    actionContext.setFailed(error.message)
  }
}
