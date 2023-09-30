import mongoose from "mongoose" ;

function initMongoose() {
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    });
    mongoose.Promise = global.Promise;
    mongoose.connection.on('error', err => {
        console.error(`Mongoose connection error: ${err.message}`);
        process.exit(1);
    });
}
export default  initMongoose();