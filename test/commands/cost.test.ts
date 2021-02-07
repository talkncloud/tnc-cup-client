import {expect, test} from '@oclif/test'

describe('cost', () => {
  test
  .stdout()
  .command(['cost', '-t', '../testfiles/Appsyncwaf_Cognito_Waf.json'])
  .it('runs cost', ctx => {
    expect(ctx.stdout).to.contain('budget')
  })

  // test
  // .stdout()
  // .command(['cost', '--name', 'jeff'])
  // .it('runs hello --name jeff', ctx => {
  //   expect(ctx.stdout).to.contain('hello jeff')
  // })
})
