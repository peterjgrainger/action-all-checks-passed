import {allStatusPassedCheck} from '../src/all-status-passed-check'
import {GitHub} from '@actions/github'
import {Context} from '@actions/github/lib/context'
import {Octokit} from '@octokit/rest'

let context: Context
let getWorkflowData: Object
let getWorkflowResponse: Octokit.AnyResponse
let getSuiteResponse: Octokit.AnyResponse
let getSuiteData: Object

beforeEach(() => {
  context = {
    repo: {
      repo: 'some-repo',
      owner: 'some-owner'
    },
    payload: {},
    eventName: '',
    sha: '',
    ref: '',
    workflow: '',
    action: '',
    actor: '',
    issue: {
      owner: '',
      repo: '',
      number: 1
    }
  }
  getWorkflowData = {
    check_suite_id: 1
  }

  const headers = {
    date: '',
    'x-ratelimit-limit': '',
    'x-ratelimit-remaining': '',
    'x-ratelimit-reset': '',
    'x-Octokit-request-id': '',
    'x-Octokit-media-type': '',
    link: '',
    'last-modified': '',
    etag: '',
    status: ''
  }

  getWorkflowResponse = {
    data: getWorkflowData,
    status: 200,
    headers: headers,
    [Symbol.iterator]: () => 'test'[Symbol.iterator]()
  }

  getSuiteData = {
    checkRuns: [
      {
        conclusion: 'success'
      }
    ]
  }

  getSuiteResponse = {
    data: getSuiteData,
    status: 200,
    headers: headers,
    [Symbol.iterator]: () => 'test'[Symbol.iterator]()
  }
})

let getWorkflowSpy: jest.SpyInstance
let getSuiteSpy: jest.SpyInstance

beforeEach(async () => {
  const octokit = new GitHub('fakeToken')
  getWorkflowSpy = jest
    .spyOn(octokit.actions, 'getWorkflowRun')
    .mockResolvedValue(getWorkflowResponse)
  getSuiteSpy = jest
    .spyOn(octokit.checks, 'listForSuite')
    .mockResolvedValue(getSuiteResponse)

  await allStatusPassedCheck({
    octokit,
    context,
    debug: jest.fn(),
    setFailed: jest.fn(),
    getInput: jest.fn().mockReturnValue('1')
  })
})

// shows how the runner will run a javascript action with env / stdout protocol
test('expect list branches to be called', () => {
  expect(getWorkflowSpy).toHaveBeenCalledWith({
    run_id: 1,
    owner: 'some-owner',
    repo: 'some-repo'
  })
})

test('expect an issue to be created', () => {
  expect(getSuiteSpy).toHaveBeenCalledWith({
    repo: 'some-repo',
    owner: 'some-owner',
    check_suite_id: 1
  })
})
