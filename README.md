# 도서목록등록
Node.js를 이용해 도서관의 도서목록 등록, 조회, 삭제, 수정 기능구현
<br><br>

## 설명
<img src="https://img.shields.io/badge/Node.js-0c740a?style=flat-square&logo=Node.js&logoColor=white"/> <a href="https://github.com/jurin2/library/"><img src="https://img.shields.io/badge/GITHUB-171717?style=flat-square&logo=GITHUB&logoColor=white"/>
<br><br>

1. ### 도서목록등록
#### 도서목록 등록시 mongodb에 데이터 저장합니다.
![image](https://user-images.githubusercontent.com/89722981/165805936-59f776e1-ba60-4fcf-85a8-a90daba79301.png)
<pre>
<code>
// mongodb
const MongoClient = require('mongodb').MongoClient;

// 데이터베이스 접근
let dbUrl = 'mongodb+srv://admin:qwer1234@cluster0.3uwxb.mongodb.net/bookDB?retryWrites=true&w=majority';
let bookApp;

MongoClient.connect(dbUrl,
  (error,client)=>{ 
    if(error) return console.log('데이터베이스 오류');

    bookApp = client.db('bookDB');

    app.listen(8080,()=>{
        console.log('8080 포트 오픈');
    })
  }
)

// 글 등록
app.get('/write',(req,res)=>{
    res.render('write.ejs');
})
</code>
</pre>

2. ### 도서목록 조회, 수정 삭제
#### mongodb에 저장된 데이터를 조회페이지에 보여주고 데이터의 수정과 삭제를 가능하게 했습니다.

- ### mongodb 데이터베이스
<img src="https://user-images.githubusercontent.com/89722981/165932644-fa809d67-2867-4dba-8f51-a4d187802f60.png" width="70%" alt="mongodb"/>

- #### 도서목록 조회, 삭제
<img src="https://user-images.githubusercontent.com/89722981/165805992-3c530118-0437-4818-a1df-56d0fe3e3597.png" width="100%" alt="도서목록 조회"/>
  
- #### 도서목록 수정
<img src="https://user-images.githubusercontent.com/89722981/165933045-49adf348-c6f4-4ad7-985f-b271437864f4.png" width="100%" alt="도서목록 수정"/>  
<pre>
<code>
// 글 삭제
app.delete('/delete',(req,res)=>{
  req.body._id=parseInt(req.body._id);
  bookApp.collection('booklist').deleteOne({_id:req.body._id},(error,result)=>{
    if(error) return console.log('삭제 오류');
    res.status(200);
  }) 
});

// 글 수정
// 등록된 글을 찾는다
app.get('/update/:id',(req,res)=>{
  bookApp.collection('booklist').findOne({_id:Number(req.params.id)},(error,result)=>{
    res.render('update.ejs',{결과:result});
  })  
})

app.put('/put',(req,res)=>{
  let appNumber = Number(req.body.number);
  let appTitle = req.body.title;
  let appContent = req.body.content;
  let appGenre = req.body.genre;
  let appWriter = req.body.writer;

  bookApp.collection('booklist').updateOne(
    {_id:Number(req.body.id)},
    {$set:{number:appNumber, title:appTitle, content:appContent, genre:appGenre, writer:appWriter}},
    (error,result)=>{
      if(error) return console.log('수정 오류');
      res.redirect('/');
    })
})


// 넘어온 자료를 데이터베이스에 기록
app.post('/add',(req,res)=>{
  let appNumber = parseInt(req.body.number);
  let appTitle = req.body.title;
  let appContent = req.body.content;
  let appGenre = req.body.genre;
  let appWriter = req.body.writer;

  bookApp.collection('postcount').findOne({번호:'번호',제목:'제목',내용:'내용',장르:'장르',저자:'저자'},(error,result)=>{
    if(error) return console.log('검색 오류');
    let totalCount = result.전체갯수;

    bookApp.collection('booklist').insertOne({
      number:appNumber, title:appTitle, content:appContent, genre:appGenre, writer:appWriter, _id:totalCount+1
    },(error,result)=>{
      if(error) return console.log('등록 오류');
      console.log('등록 성공');

      bookApp.collection('postcount').updateOne({번호:'번호',제목:'제목',내용:'내용',장르:'장르',저자:'저자'},{$inc:{전체갯수:1}},
      (error,result)=>{
          if(error) return console.log('업데이트 오류');  
          res.redirect('/');
      })
    })
  })
})

// index.ejs에 넘어온 자료를 보여줌
app.get('/',(req,res)=>{
  bookApp.collection('booklist').find().toArray((error,result)=>{
    if(error) return console.log('자료검색 오류');
    res.render('index.ejs',{bookData:result});
  })
})
</code>
</pre>
