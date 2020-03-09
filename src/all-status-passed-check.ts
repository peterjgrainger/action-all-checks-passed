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

    if(checks.data.check_runs.length > 0) {
      const successfulRuns = checks.data.check_runs.filter(
        value => value.conclusion === 'success'
      )

      debug(`${successfulRuns.length} runs are successful`)

  
      const conclusion = successfulRuns.length === checks.data.total_count ? 'success' : 'failure'
  
      actionContext.octokit.checks.create({
        ...actionContext.context.repo,
        head_sha: checks.data.check_runs[0].head_sha,
        name: 'All checks pass',
        status: 'completed',
        conclusion: conclusion
      })
    }
  } catch (error) {
    actionContext.setFailed(error.message)
  }
}
