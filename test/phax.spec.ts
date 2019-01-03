import { expect } from 'chai';
import phax from '../lib/index';

describe("phax", () => {

  it("get request", () => {
    return phax.get('/test?id=1').json()
      .then(function(json: any) {
        expect(json.method).to.equal('GET');
        expect(json.body.id).to.equal("1");
        expect(json.url).to.equal('/test?id=1');
      });
  });

  it("get request object", () => {
    return phax({
      url: '/test?id=1',
      method: 'get'
    }).json()
      .then(function(json: any) {
        expect(json.method).to.equal('GET');
        expect(json.body.id).to.equal("1");
        expect(json.url).to.equal('/test?id=1');
      });
  });

  it('post text', () => {
    return phax.post('/post_text', {
      body: 'post'
    }).json().then((json: any) => {
      expect(json.method).to.equal('POST');
      expect(json.body).to.equal("post");
      expect(json.url).to.equal('/post_text');
      expect(json.sendType).to.equal('text/plain');
    });
  });

  it('post urlencoded', () => {
    return phax.post('/post_urlencoded', {
      body: 'id=1',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).json().then((json: any) => {
      expect(json.body.id).to.equal('1');
      expect(json.url).to.equal('/post_urlencoded');
      expect(json.sendType).to.equal('application/x-www-form-urlencoded');
    });
  });

  it('post json', () => {
    return phax.post('/post_json', {
      json: { id: 1 }
    }).json().then((json: any) => {
      expect(json.body.id).to.equal(1);
      expect(json.url).to.equal('/post_json');
      expect(json.sendType).to.equal('application/json');
    });
  });
});
