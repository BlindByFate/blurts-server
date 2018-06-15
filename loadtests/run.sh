source molotov.env

echo "WEIGHT_HOMEPAGE=$WEIGHT_HOMEPAGE"
echo "WEIGHT_SCAN=$WEIGHT_SCAN"
echo "DURATION=$DURATION"
echo "PROCESSES=$PROCESSES"
echo "WORKERS=$WORKERS"
echo "DELAY=$RUN_DELAY"

WEIGHT_HOMEPAGE=$WEIGHT_HOMEPAGE \
WEIGHT_SCAN=$WEIGHT_SCAN \
time molotov "$VERBOSE" -d "$DURATION" -p "$PROCESSES" -w "$WORKERS" --delay "$RUN_DELAY" loadtest.py
