def read_data(data_file='data.json'):
    data = "{}"
    try:
        with open(data_file, 'r') as file:
            data = file.read()
            file.close()
    except IOError:
        with open(data_file, 'w') as file:
            file.write(data)
            file.close()
    return data


def write_data(data, data_file='data.json'):
    if not data:
        data = "{}"
    with open(data_file, 'w') as file:
        file.write(data)
        file.close()
