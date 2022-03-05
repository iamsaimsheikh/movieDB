const Joi = require('@hapi/joi')


// User Validations

const userRegisterValidation = data => {

    const schema =  Joi.object({
        name: Joi.string().min(3).required().regex(/^[a-zA-Z ]*$/),
        email: Joi.string().email().required(),
        phone: Joi.number().required().min(7),
        password: Joi.string().required().min(8),
    })

    return schema.validate(data)

}

const userLoginValidation = data => {

    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required().min(8),
    })

    return schema.validate(data)

}

// Actor Validations

const addActorValidation = data => {

    const schema = Joi.object({
        name: Joi.string().min(3).required().regex(/^[a-zA-Z ]*$/),
        age: Joi.number().required(),
        gender: Joi.string().required()
    })

    return schema.validate(data)

}

// Movie Validations

const movieInfoValidation = data => {

    const schema = Joi.object({
        name: Joi.string().min(3).required().regex(/^[a-zA-Z ]*$/),
        genre: Joi.array(),
        business_done: Joi.number()

    })

    return schema.validate(data)

}

const movieReviewValidation = data => {

    const schema = Joi.object({

        user_id: Joi.string().empty(),
        name: Joi.string().min(3),
        review: Joi.string().min(10)

    })

    return schema.validate(data)
}

module.exports.userRegisterValidation = userRegisterValidation;
module.exports.userLoginValidation = userLoginValidation;
module.exports.addActorValidation = addActorValidation;
module.exports.movieInfoValidation = movieInfoValidation;
module.exports.movieReviewValidation = movieReviewValidation;