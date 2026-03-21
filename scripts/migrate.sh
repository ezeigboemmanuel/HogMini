# Exit immediately if any command fails
set -e 

DB_URL=$1
MIGRATIONS_DIR=$2

if [ -z "$DB_URL" ] || [ -z "$MIGRATIONS_DIR" ]; then
  echo "Usage: ./scripts/migrate.sh <DATABASE_URL> <MIGRATIONS_DIR>"
  exit 1
fi

echo "Checking migrations in $MIGRATIONS_DIR..."

# FIX: Use 'find' instead of 'ls' to safely grab .sql files. 
# If none exist, this safely returns an empty array.
MIGRATIONS=($(find "$MIGRATIONS_DIR" -maxdepth 1 -name "*.sql" 2>/dev/null | sort -V))

# If the array is empty, exit gracefully
if [ ${#MIGRATIONS[@]} -eq 0 ]; then
  echo "nothing to do"
  exit 0
fi

APPLIED_COUNT=0

for file in "${MIGRATIONS[@]}"; do
  filename=$(basename "$file")

  # Ask Postgres if this specific filename is already in the tracking table
  is_applied=$(psql "$DB_URL" -tAc "SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE filename='$filename');")

  if [ "$is_applied" = "f" ]; then
    echo "Applying: $filename"
    
    # Run the actual SQL file
    psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$file" > /dev/null
    
    # Insert the record into the tracking table
    psql "$DB_URL" -c "INSERT INTO schema_migrations (filename) VALUES ('$filename');" > /dev/null
    
    APPLIED_COUNT=$((APPLIED_COUNT + 1))
  fi
done

if [ $APPLIED_COUNT -eq 0 ]; then
  echo "nothing to do"
else
  echo "Successfully applied $APPLIED_COUNT new migration(s)."
fi