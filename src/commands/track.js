const moment = require('moment')
const { rastro } = require('rastrojs')

const getObjectInformation = async object => (await rastro.track(object)).shift()

module.exports = {
    name: 'track',
    alias: 't',
    description: 'Track an object from Correios SRO. e.g. correios-cli track AA123456789BR',
    run: async ({ parameters, print }) => {
        const object = parameters.first

        // Verify the object argument
        if (! object) {
            print.error('The object must be specified')

            return
        }

        const spinner = print.spin(`Tracking ${object}...`)

        getObjectInformation(object)
            .then(information => {
                spinner.stop()

                // Check the information object received
                if (information.isInvalid) {
                    print.error('No information to show about this object')

                    return
                }

                const data = []

                for ({ locale, status, observation, trackedAt } of information.tracks) {
                    trackedAt = moment(trackedAt).format('DD/MM/YYYY kk:mm')

                    data.push([locale, status, observation, trackedAt])
                }

                print.table(data, { format: 'lean' })
            })
    }
}
