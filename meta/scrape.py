import os

# Directory to search
root_dir = r'/Users/danielsu/Documents/GitHub/metallama/meta'  # Use raw string to avoid escape characters
output_file = 'all_contents.txt'

# List of file extensions to include
extensions = ['.tsx', '.ts', '.js', '.jsx', 'css']

# List of directories to ignore
ignore_dirs = ['node_modules', '.next', '.vercel']

def should_ignore_dir(directory):
    return any(ignore in directory for ignore in ignore_dirs)

def gather_files(root_dir, extensions, ignore_dirs):
    files_to_read = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Ignore specified directories
        if should_ignore_dir(dirpath):
            continue
        for filename in filenames:
            if any(filename.endswith(ext) for ext in extensions):
                files_to_read.append(os.path.join(dirpath, filename))
    return files_to_read

def read_and_write_files(files, output_file):
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for file in files:
            with open(file, 'r', encoding='utf-8') as infile:
                outfile.write(f"// Contents of {file}\n")
                outfile.write(infile.read())
                outfile.write("\n\n")

files_to_read = gather_files(root_dir, extensions, ignore_dirs)
read_and_write_files(files_to_read, output_file)

print(f"All relevant files have been written to {output_file}")
