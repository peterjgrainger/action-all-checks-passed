import {ActionContext} from './action-context'
import {debug} from '@actions/core'

export async function allStatusPassedCheck(
  actionContext: ActionContext
): Promise<void> {
  try {
    const eventPayloadHeadSha =
      actionContext.context.payload['check_run']['head_sha']

    debug(`Getting all checks for ref ${eventPayloadHeadSha}`)

    const checks = await actionContext.octokit.checks.listForRef({
      ...actionContext.context.repo,
      ref: eventPayloadHeadSha
    })

    debug(`Got back ${checks.data.total_count} checks`)

    const runs = checks.data.check_runs

    if (checks.data.check_runs.length > 0) {
      const currentAllChecksRun = runs.filter(
        value => value.name === 'All checks pass'
      )

      const successfulRuns = runs.filter(
        value =>
          value.conclusion === 'success' && value.name !== 'All checks pass'
      )

      const statusMessage = runs
        .map(
          value =>
            `The check for ${value.name} was ${value.status}: ${value.conclusion}`
        )
        .join('\n')
      debug(`${successfulRuns.length} runs are successful`)

      const conclusion =
        successfulRuns.length === checks.data.total_count
          ? 'success'
          : 'failure'

      debug(`conclusion was ${conclusion}`)

      // Update current run or make a new "Check all"
      if (currentAllChecksRun.length === 0) {
        debug('Adding new check')
        actionContext.octokit.checks.create({
          ...actionContext.context.repo,
          //eslint-disable-next-line @typescript-eslint/camelcase
          head_sha: eventPayloadHeadSha,
          name: 'All checks pass',
          status: 'completed',
          conclusion,
          output: {
            title: 'Detail',
            summary: statusMessage
          }
        })
      } else {
        debug('updating existing check')
        actionContext.octokit.checks.update({
          ...actionContext.context.repo,
          //eslint-disable-next-line @typescript-eslint/camelcase
          check_run_id: currentAllChecksRun[0].id,
          status: 'completed',
          conclusion,
          output: {
            title: 'Detail',
            summary: statusMessage
          }
        })
      }
    }
  } catch (error) {
    actionContext.setFailed(error.message)
  }
}
