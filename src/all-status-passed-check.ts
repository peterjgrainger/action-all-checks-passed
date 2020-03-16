import {ActionContext} from './action-context'
import {debug} from '@actions/core'

export async function allStatusPassedCheck(
  actionContext: ActionContext
): Promise<void> {
  try {
    const eventPayloadRunId =
      actionContext.context.payload['check_run']['head_sha']

    const checks = await actionContext.octokit.checks.listForRef({
      ...actionContext.context.repo,
      ref: eventPayloadRunId
    })

    const runs = checks.data.check_runs

    if (checks.data.check_runs.length > 0) {
      const currentAllChecksRun = runs.filter(
        value => (value.name = 'All checks pass')
      )

      const successfulRuns = runs.filter(
        value =>
          value.conclusion === 'success' && value.name !== 'All checks pass'
      )

      debug(`${successfulRuns.length} runs are successful`)

      const conclusion =
        successfulRuns.length === checks.data.total_count
          ? 'success'
          : 'failure'

      // Update current run or make a new "Check all"
      if (currentAllChecksRun.length === 0) {
        actionContext.octokit.checks.create({
          ...actionContext.context.repo,
          //eslint-disable-next-line @typescript-eslint/camelcase
          head_sha: eventPayloadRunId,
          name: 'All checks pass',
          status: 'completed',
          conclusion
        })
      } else {
        actionContext.octokit.checks.update({
          ...actionContext.context.repo,
          //eslint-disable-next-line @typescript-eslint/camelcase
          check_run_id: currentAllChecksRun[0].id,
          status: 'completed',
          conclusion
        })
      }
    }
  } catch (error) {
    actionContext.setFailed(error.message)
  }
}
