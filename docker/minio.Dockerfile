FROM minio/minio:RELEASE.2023-05-04T21-44-30Z

COPY --from=minio/mc:RELEASE.2023-05-04T18-10-16Z /usr/bin/mc /usr/local/bin/mc

COPY ./minio-docker-entrypoint.sh /

COPY ./sample-pdf.pdf /tmp/sample-pdf.pdf
COPY ./sample-jpg.jpg /tmp/sample-jpg.jpg

ENTRYPOINT ["/minio-docker-entrypoint.sh"]
CMD ["--address", ":9000", "--console-address", ":9001"]