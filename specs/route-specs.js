
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const chaiHttp = require('chai-http')
const server = require('../app')

chai.use(chaiHttp)

const add = (arg1, arg2) => {
    return arg1 + arg2
}


describe('/ Testing Actor Routes', async () => {

    // 

    await it('Test Actor Routes', (done) => {

         chai.request(server)
        .get('/actor/all')
        .end((err, res) => {
            res.should.have.status(200)
            if(err) return console.log(err)

            done();
        });

    })

   

})