import {ActionContext} from './action-context'
import {debug} from '@actions/core'

export async function allStatusPassedCheck(
  actionContext: ActionContext
): Promise<void> {
  try {
    const checks = await actionContext.octokit.checks.listForSuite({
      ...actionContext.context.repo,
      //eslint-disable-next-line @typescript-eslint/camelcase
      check_suite_id: actionContext.context.payload['check_suite']['id']
    })

    if (checks.data.check_runs.length > 0) {
      const successfulRuns = checks.data.check_runs.filter(
        value => value.conclusion === 'success'
      )

      debug(`${successfulRuns.length} runs are successful`)

      const conclusion =
        successfulRuns.length === checks.data.total_count
          ? 'success'
          : 'failure'

      actionContext.octokit.checks.create({
        ...actionContext.context.repo,
        //eslint-disable-next-line @typescript-eslint/camelcase
        head_sha: checks.data.check_runs[0].head_sha,
        name: 'All checks pass',
        status: 'completed',
        conclusion
      })
    }
  } catch (error) {
    actionContext.setFailed(error.message)
  }
}
