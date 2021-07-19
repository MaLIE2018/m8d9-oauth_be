import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import createError  from 'http-errors';

const {Schema, model} = mongoose

const authorSchema = new Schema({
  name: {type: String, required: true},
  avatar:{type: String, default: ""},
  email: {type: String, required: true},
  password: {type: String},
  dateOfBirth:{type: Date},
  blogPosts:[{type: Schema.Types.ObjectId, ref: "blogposts"}, {default:[]}],
  refreshToken: {type: String, default: ""},
  googleId:{type: String}
}, {timestamps: true})


authorSchema.post("validate", function(error,doc, next){
  if(error){
    next(createError(400, {errorList: error}))
  }else{
    next()
  }
})

authorSchema.methods.toJSON = function(){
  const user = this
  const userObj = user.toObject()
  delete userObj.password
  delete userObj.__v
  delete userObj.refreshToken
  return userObj 
}

authorSchema.pre("save", async function(next){
    const newUser = this
    if(newUser.isModified("password")){
      newUser.password = await bcrypt.hash(newUser.password, 10)
    }
    next()
})


authorSchema.statics.checkCredentials = async function(email, plainPw){

  const user = await this.findOne({email})

 
  
  if(user){
    const hashedPw = user.password
   

    const isMatch = await bcrypt.compare(plainPw,hashedPw)
 

    if(isMatch) return user
    else return null
  }else{
    return null
  }

}


export default model("authors", authorSchema)