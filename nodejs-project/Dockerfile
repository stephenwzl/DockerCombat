FROM daocloud.io/node:boron
EXPOSE 3000
VOLUME [ "/code" ]
COPY entry.sh /
RUN chmod +x entry.sh
ENTRYPOINT [ "sh", "entry.sh" ]