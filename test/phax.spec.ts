import { expect } from 'chai';
import { get, post } from '../lib/index';

describe("phax", () => {

  it("get request", () => {
    return get('/test?id=1').json()
      .then(function(json) {
        expect(json.method).to.equal('GET');
        expect(json.body.id).to.equal("1");
        expect(json.url).to.equal('/test?id=1');
      });
  });

  it('post text', () => {
    return post('/post_text', {
      body: 'post'
    }).json().then(json => {
      expect(json.method).to.equal('POST');
      expect(json.body).to.equal("post");
      expect(json.url).to.equal('/post_text');
      expect(json.sendType).to.equal('text/plain');
    });
  });

  it('post urlencoded', () => {
    return post('/post_urlencoded', {
      body: 'id=1',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).json().then(json => {
      expect(json.body.id).to.equal('1');
      expect(json.url).to.equal('/post_urlencoded');
      expect(json.sendType).to.equal('application/x-www-form-urlencoded');
    });
  });

  it('post json', () => {
    return post('/post_json', {
      json: { id: 1 }
    }).json().then(json => {
      expect(json.body.id).to.equal(1);
      expect(json.url).to.equal('/post_json');
      expect(json.sendType).to.equal('application/json');
    });
  });
});
