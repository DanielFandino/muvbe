function onload()
{
    document.addEventListener("deviceready",onDR,false);
}
function onDR()
{

}

var muvbe = angular.module('muvbe', [
  'ngRoute',
]);

//Variables
var urlAppServer = 'http://londonojp.com/muvbe/web/wp-json/wp/v2';
var userHashAdmin = 'YWRtaW46YWRtaW4=';

//App controller
muvbe.controller('muvbeController', function ($scope, $http){
  var scope = this;

  scope.user = JSON.parse(localStorage.getItem("userSession"));
  scope.media = JSON.parse(localStorage.getItem("media"));
  scope.comments = JSON.parse(localStorage.getItem("comments"));
  scope.categories = JSON.parse(localStorage.getItem("categories"));
  scope.users = JSON.parse(localStorage.getItem("users"));
  scope.posts = JSON.parse(localStorage.getItem("posts"));

  if (!scope.user){
    window.location = "#/";
  }

  scope.getMedia = function(){
    $http.get(urlAppServer + "/media?per_page=100").success(function(data){
      scope.media = data;
      localStorage.setItem("media", JSON.stringify(scope.media));
    });
  }

  scope.getCategories = function(){
    $http.get(urlAppServer + "/categories?per_page=100").success(function(data){
      scope.categories = data;
      localStorage.setItem("categories", JSON.stringify(scope.categories));
    });
  }

  scope.getUsers = function(){
    $http.get(urlAppServer + "/users?per_page=100").success(function(data){
      scope.users = data;
      localStorage.setItem("users", JSON.stringify(scope.users));
    });
  }

  scope.getComments = function(){
    $http.get(urlAppServer + "/comments?per_page=100").success(function(data){
      scope.comments = data;
      localStorage.setItem("comments", JSON.stringify(scope.comments));
    });
  }

  var monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  var posts = new Array();
  scope.getPosts = function(){
    posts = new Array();
    $http.get(urlAppServer + "/posts?per_page=100").success(function(data){
      for(var post_data in data) {
        var post = new Object();
        post.id = data[post_data].id;
        post.title = data[post_data].title.rendered;
        post.content = data[post_data].content.rendered;
        post.author = data[post_data].author;
        post.authorName = scope.getAuthorName(data[post_data].author);
        var datePost = new Date(data[post_data].date);
        post.date = datePost.getDate() + " de " + monthNames[datePost.getMonth()] + " del " + datePost.getFullYear();
        post.categoryId = data[post_data].categories[0];
        post.categoryName = scope.getCategoryName(data[post_data].categories[0]);
        post.mediaId = data[post_data].featured_media;
        scope.getImageUrlByPost(post, data[post_data].featured_media);
        scope.getCommentsByPost(post);
        posts.push(post);
        scope.posts = posts;
      }
      localStorage.setItem("posts", JSON.stringify(scope.posts));
    });
  }

  scope.getAllData = function(){
    scope.messageData = "Cargando...";
    scope.posts = new Array();
    $http.get(urlAppServer + "/categories?per_page=100").success(function(data){
      scope.categories = data;
      localStorage.setItem("categories", JSON.stringify(scope.categories));
      $http.get(urlAppServer + "/users?per_page=100").success(function(dataUsers){
        scope.users = dataUsers;
        localStorage.setItem("users", JSON.stringify(scope.users));
        $http.get(urlAppServer + "/comments?per_page=100").success(function(dataComments){
          scope.comments = dataComments;
          localStorage.setItem("comments", JSON.stringify(scope.comments));
          $http.get(urlAppServer + "/media?per_page=100").success(function(dataMedia){
            scope.media = dataMedia;
            localStorage.setItem("media", JSON.stringify(scope.media));
            scope.getPosts();
          });
        });
      });
    });
  }

  scope.getImageUrlByPost = function(post, mediaId){
    if(!scope.media){
      scope.getMedia();
    }else{
      var media = scope.media;
      for(var media_data in media) {
        if (mediaId == media[media_data].id){
          post.urlFeaturedImage = media[media_data].source_url;
        }
      }
    }
  }

  scope.getCommentsByPost = function( post){
    if(!scope.comments){
      scope.comments();
    }else{
      var comments = scope.comments;
      post.comments = Array();
      for(var comments_data in comments) {
        if (post.id == comments[comments_data].post){
          var commentInfo = new Object();
          commentInfo.id = comments[comments_data].id;
          commentInfo.authorId = comments[comments_data].author;
          commentInfo.authorName = comments[comments_data].author_name;
          var dateComment = new Date(comments[comments_data].date);
          commentInfo.date = dateComment.getDate() + " de " + monthNames[dateComment.getMonth()] + " del " + dateComment.getFullYear();
          commentInfo.content = comments[comments_data].content.rendered;
          post.comments.push(commentInfo);
        }
      }
    }
  }

  scope.getCategoryName = function(categoryId){
    if(!scope.categories){
      scope.getCategories();
    }else{
      categories = scope.categories;
      for(var category in scope.categories) {
        if (categories[category].id == categoryId){
          return categories[category].name;
        }
      }
    }
  }

  scope.getAuthorName = function(authorId){
    if(!scope.users){
      scope.getUsers();
    }else{
      users = scope.users;
      for(var user in scope.users) {
        if (users[user].id == authorId){
          return users[user].name;
        }
      }
    }
  }
});


//ROUTING
muvbe.config(['$routeProvider', function ($routeProvider) {
  $routeProvider

    /*
    **  Login
    **********************************************/
    .when("/", {
      templateUrl: "partials/login/login.html",
      controller: "muvbeLoginController as mlc"
    })
    .when("/signup", {
      templateUrl: "partials/login/signup.html",
      controller: "muvbeSignUpController as msuc"
    })
    .when("/exit", {
      templateUrl: "partials/login/exit.html",
      controller: "muvbeExitController as mec"
    })

    /*
    **  Home
    **********************************************/
    .when("/home", {
      templateUrl: "partials/home/home.html",
      controller: "muvbeHomeController as mhc"
    })

    /*
    **  Content
    **********************************************/
    .when("/post-info/:postId", {
      templateUrl: "partials/content/getInfo.html",
      controller: "muvbePostInfoController as mpic"
    })
    .when("/post", {
      templateUrl: "partials/content/postInfo.html",
      controller: "muvbeCreatePostController as mcpc"
    })

    /*
    **  Categorys
    **********************************************/
    .when("/categories", {
      templateUrl: "partials/category/list.html",
      controller: "muvbeListCategotyController as mlc"
    })
    .when("/categories/:categoryId", {
      templateUrl: "partials/category/detail.html",
      controller: "muvbeDetailCategotyController as mdc"
    })

    /*
    **  User
    **********************************************/

    .when("/author/:authorId", {
      templateUrl: "partials/author/detail.html",
      controller: "muvbeDetailAuthorController as mda"
    })
    //default url
    .otherwise({redirectTo: "/" });
}]);
