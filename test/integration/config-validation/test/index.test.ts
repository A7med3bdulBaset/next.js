import path from 'path'
import { nextBuild } from 'next-test-utils'
import fs from 'fs-extra'

const nextConfigPath = path.join(__dirname, '../next.config.js')

describe('next.config.js validation', () => {
  ;(process.env.TURBOPACK ? describe.skip : describe)('production mode', () => {
    it.each([
      {
        name: 'invalid config types',
        configContent: `
        module.exports = {
          swcMinify: 'hello',
          rewrites: true,
          images: {
            loader: 'something'
          }
        }
      `,
        outputs: [
          `received 'something' at "images.loader"`,
          'Expected function, received boolean at "rewrites"',
          'Expected boolean, received string at "swcMinify"',
        ],
      },
      {
        name: 'unexpected config fields',
        configContent: `
        module.exports = {
          nonExistent: true,
          experimental: {
            anotherNonExistent: true
          }
        }
      `,
        outputs: [
          `Unrecognized key(s) in object: 'nonExistent'`,
          `Unrecognized key(s) in object: 'anotherNonExistent' at "experimental"`,
        ],
      },
    ])(
      'it should validate correctly for $name',
      async ({ outputs, configContent }) => {
        await fs.writeFile(nextConfigPath, configContent)
        const result = await nextBuild(path.join(__dirname, '../'), undefined, {
          stderr: true,
          stdout: true,
        })
        await fs.remove(nextConfigPath)

        for (const output of outputs) {
          expect(result.stdout + result.stderr).toContain(output)
        }
      }
    )
  })
})
