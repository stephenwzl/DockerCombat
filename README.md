Docker 实战入门
---

本项目旨在教会读者学习 Docker普通的日常使用

# 使用 Docker
* 镜像和容器
* 运行和访问一个容器
* 容器的数据持久化（目录映射）
* 自建容器镜像
* push镜像

# Docker Compose项目实战

* 一个 Node.js的 Demo工程
* docker-compose 容器编排概念
* 部署环境的容器构建
* 容器之间的联接


## 镜像和容器
在使用 Docker前一定要弄清楚镜像和容器的关系。用过 virtual box或类似 VM软件的同学一定清楚建立一个虚拟机需要一个系统镜像，
容器就是一个真正运行的虚拟机，而镜像就是虚拟机的镜像。Docker技术实实在在地是一种虚拟化技术，不过和 virtual box之类的虚拟化技术相比性能更高，几乎做到了和宿主电脑无缝的体验。（我也不知道怎么解释了）  

举个例子，我需要开发一个 Web服务，数据库需要 MySQL或 MongoDB，自己电脑上安装 MySQL很明显很“脏”，经常得用一条命令启动或者把它加到启动项里面。假如换 MongoDB还得装 MongoDB，慢慢地电脑上装的软件越来越多。   

换用 Docker有个好处，想用 MySQL直接拉 MySQL镜像跑一个容器，换 MongoDB也就是换个镜像跑的事儿，很方便。要删除时只需要把容器和镜像删掉就行了。  

## 运行和访问一个容器 
> 假定你已经安装了 Docker

假如我需要运行 MongoDB，只需要两步： 

```
# 拉取 MongoDB 镜像
docker pull mongo  

# 从镜像容器生成一个容器运行
docker run mongo
```
Docker的镜像是有 tag的概念的，就好像 git的分支一样，镜像的默认 tag是 `latest`，类似于 git的 `master`  
`docker pull mongo` 就是默认拉取了 `mongo:latest`    

Docker从镜像运行容器时默认是从命令行阻塞的方式运行的，所以 `docker run mongo`跑起来会一直阻塞在命令行里，假如你关闭了或者 ctrl+c了，这个容器也会退出。要想后台运行只需要 `-d`参数，即以“守护进程”的方式运行。  

查看容器只需要  

```
# 运行中的
docker ps

# 所有，包括已经退出的
docker ps -a
```

其他能用到的命令还有   

```
# 查看所有镜像  
docker images 

# 删除镜像
docker rmi image_id/image_name:tag

# 删除容器
docker rm container_id/container_name

# 运行、重启容器
docker start/restart  container_id/container_name
```

> 要注意区分一下 docker run 和 docker start, run 是指从镜像生成容器，但如果你只是想跑一个已经停止的容器的话，要用 start

接下来要访问这个容器，但你只发现这个容器在跑，不知道它任何的 ip，因为容器的 ip是随机分配的，到底是多少只有 docker它自己知道，所以我们一般做法是对容器进行端口映射，所以把刚才跑的 MongoDB容器删了吧，我们重新跑一个:  

```
docker run --name mongodb -p 27017:27017 -d mongo
```  

这条命令的意思是命名容器为 'mongodb'，把本机的 27017端口和容器的 27017进行映射，那么你访问 localhost:27017其实就是访问 mongodb容器的 27017端口，自然就能连接上 MongoDB数据库了。  

## 容器的数据持久化（目录映射） 
从上一步会有一个疑问，容器内 MongoDB的数据是不是存在这个容器里？假如这个容器被删除了岂不是数据也没了？  
所以我们要把容器的数据给持久化（保存到本机）。很简单，只需要做一次目录映射就好了，我们把上一步的容器删了，重新来跑一个符合要求的容器：    

```
docker run --name mongodb -p 27017:27017  -v /database:/data/db -d mongo
``` 

可以看到多加了一条 `/database:/data/db`, 这是指把容器里面的 /data/db映射到本机的 /database目录，那么这个容器跑起来后，你在本机的 /database目录就会看到容器内 MongoDB产生的数据。 

## 自建容器镜像 
看完上面几步，你会不会有个疑问：你怎么知道 mongo镜像在跑容器的时候会给你 27017端口和 `/data/db`目录？  

很显然这是镜像的构建者写在文档里面的，我们也可以尝试构建一个镜像，准备从一个干净的 CentOS系统生成一个 redis-server镜像，然后只要容器运行，就是在跑一个 redis-server。  

首先需要写一个 Dockerfile:  

```
FROM daocloud.io/library/centos:6.8
EXPOSE 6379
RUN yum install -y epel-release
RUN yum install -y redis
ENTRYPOINT [ "redis-server" ]
```

FROM 表示从某个镜像为基础构建   
EXPOSE 表示暴露 6379端口，这样使用时就可以映射 6379端口了   
RUN 后面的命令就是普通的 Shell命令，这两行 RUN表示安装一下 redis  
ENTRYPOINT 是指容器运行时的启动命令，这个命令必须是阻塞的，如果是后台的（守护进程），那么容器跑起来后没有阻塞就会退出，所以我们直接写平时阻塞态运行的的命令 “redis-server” 就好了。  

接下来，进行一次build：  

```
docker build -t stephenwzl/redis:test .
``` 

-t 表示给镜像打 tag， 冒号前面的 `stephenwzl/redis`是 用户名+镜像名的模式，冒号前还可以在最前面加一位网站，比如上面的 daocloud.io，标明镜像是该网站的，如果不加默认就是 hub.docker.com，冒号后是 tag。  

然后 build命令跑一会儿完毕后你就可以 `docker images`查看这个镜像了。运行方式和前文一样。  

我们都知道 Linux下 redis的配置文件在 `/etc/redis.conf`，所以我们可以把 `/etc`目录开放给使用者，只需要在 Dockerfile加一行： `VOLUME [ "/etc" ]`, 重新 build镜像，那么从新的镜像跑出来的容器就可以映射 `/etc`目录出来，使用的人就可以随意修改 redis.conf了！  

## push镜像  
要把自建的镜像给别人用，需要 push到一个中心（hub），Docker官方的是 hub.docker.com。我们只需要注册一个账号，然后在命令行执行 `docker login`，登录成功后再 `docker push your_name/redis:test`，就可以把刚才的镜像推上去了，别人也就能拉到了。  

