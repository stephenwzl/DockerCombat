FROM daocloud.io/library/centos:6.8
EXPOSE 6379
RUN yum install -y epel-release
RUN yum install -y redis
ENTRYPOINT [ "redis-server" ]
