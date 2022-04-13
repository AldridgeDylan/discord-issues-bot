import  axios from 'axios';
import qs from 'qs';
var data = qs.stringify({
  'id': '2',
  'exception': 'test',
  'description': 'test' 
});
var config = {
  method: 'post',
  url: 'http://44.201.133.152:3000/status/addTestIssue',
  headers: { 
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});