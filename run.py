
from app import app


if __name__ == '__main__':
    from os import path, walk
    extra_dirs = ['./app', ]
    extra_files = extra_dirs[:]
    for extra_dir in extra_dirs:
        for dirname, dirs, files in walk(extra_dir):
            for filename in files:
                filename = path.join(dirname, filename)
                if path.isfile(filename):
                    extra_files.append(filename)
    app.run(debug=True, host='0.0.0.0', port=5001, extra_files=extra_files)
