import {Context} from '@actions/github/lib/context'
import {GitHub} from '@actions/github'
import {InputOptions} from '@actions/core'

export interface ActionContext {
  debug: (message: string) => void
  setFailed: (message: string) => void
  getInput: (name: string, options?: InputOptions | undefined) => string
  octokit: GitHub
  context: Context
}
