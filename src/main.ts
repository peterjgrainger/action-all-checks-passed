import {debug, setFailed, getInput} from '@actions/core'
import {GitHub, context} from '@actions/github'
import {allStatusPassedCheck} from './all-status-passed-check'

async function run(): Promise<void> {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw ReferenceError('No Token found')

  await allStatusPassedCheck({
    debug,
    setFailed,
    getInput,
    octokit: new GitHub(token),
    context
  })
}

run()
