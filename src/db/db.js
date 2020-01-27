const mongoose = require('mongoose')
process.env['NODE_CONFIG_DIR'] = __dirname

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    })

    console.log('MongoDB Connected...')
  } catch (err) {
    console.log(err.message)
    // Exit process with failure
    process.exit(1)
  }
}

module.exports = connectDB
