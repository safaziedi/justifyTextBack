import { expect } from 'chai';
import supertest from 'supertest';
import app from './app'; 
const request = supertest(app);

describe('Justify API', () => {
  describe('POST /api/token', () => {
    it('should generate a token', (done) => {
      request
        .post('/api/token')
        .send('safaziedi070@gmail.com')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('token');
          done();
        });
    });
  });

    it('should handle unauthorized request', (done) => {
      const text = 'This is a sample text for justification.';
      request
        .post('/api/justify')
        .send(text)
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
});
