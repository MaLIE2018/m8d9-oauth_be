import passport from "passport";
import GoogleStrategy from "passport-google-oauth20"
import AuthorModel from "../schemas/authorSchema.js"
import {JWTRefreshAuth} from "./tools.js";


passport.use("google", new GoogleStrategy({
  clientID: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: "http://localhost:3001/authors/googleRedirect"
}, async (accessToken, refreshToken,profile, passportNext) =>{
 
  try {
    console.log('profile:', profile)
    const user = await AuthorModel.findOne({googleId: profile.id});

    if(user){
      const tokens = await JWTRefreshAuth(user)
      passportNext(null, {user, tokens})
    }else{
      const newUser = {
        name: profile.name.givenName,
        email:profile.emails[0].value,
        googleId: profile.id
      }
      const createdUser = new AuthorModel(newUser)
      const savedUser = await createdUser.save()
      const tokens = await JWTRefreshAuth(savedUser)
      passportNext(null, {user: savedUser, tokens})
    }
  } catch (error) {
    passportNext(error)
  }
}))

passport.serializeUser(function (user, passportNext) { // this is for req.user
  passportNext(null, user)
})



export default {}